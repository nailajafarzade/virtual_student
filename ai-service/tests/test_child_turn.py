import unittest
from unittest import mock
from fastapi import HTTPException

from app.api.child_turn import ChildTurnRequest, child_turn
from app.child_agent.llm_agent import _clean
from app.child_agent.prompt_builder import build_prompt
from app.child_state_engine.models import ChildState, TurnOutcome
from app.curriculum.models import CurriculumTopicDTO
from app.llm_runtime.ollama_client import LlmGenerationError
from app.response_validator.validator import validate_response

COUNTING = {
    "id": 1, "name": "Counting 1 to 5",
    "objective": "Child can count a small group of objects from 1 to 5 and state the total.",
    "acceptableAnswers": ["five", "5"],
    "commonMisconceptions": ["I counted four, but I skipped one!"],
}
SHAPES = CurriculumTopicDTO(
    id=2, name="Basic Shape Recognition", objective="Child can name circle, square, triangle.",
    acceptable_answers=["circle", "square", "triangle"],
    common_misconceptions=["Is it a square? No wait, a triangle has corners too..."],
)


def _request(utterance, recent_turns=None):
    # Spring-in göndərdiyi camelCase JSON formatı.
    return ChildTurnRequest.model_validate({
        "sessionId": 1, "turnSequenceNo": 1, "teacherUtterance": utterance,
        "curriculumTopic": COUNTING, "recentTurns": recent_turns or [],
    })


def _run(utterance, outcome, llm_replies, recent_turns=None):
    """Turn-u verilmiş outcome və saxta LLM cavabları ilə işlədir; (response, generate mock) qaytarır."""
    with mock.patch("app.api.child_turn.decide_turn_outcome", return_value=outcome), \
            mock.patch("app.child_agent.child_agent.settings.llm_enabled", True), \
            mock.patch("app.llm_runtime.ollama_client.generate", side_effect=llm_replies) as gen:
        return child_turn(_request(utterance, recent_turns)), gen


class ChildTurnFlowTest(unittest.TestCase):

    def test_normal_question_passes_llm_answer_through(self):
        resp, gen = _run("How many apples do you see?", TurnOutcome.CORRECT, ["Child: Um... five?"])
        self.assertEqual(resp.child_response_text, "Um... five?")
        self.assertTrue(resp.validation_passed)
        prompt = gen.call_args.args[0]
        self.assertIn('Teacher just said: "How many apples do you see?"', prompt)
        self.assertIn('"five"', prompt)  # CORRECT cavab mövzu cavablarına əsaslanır

    def test_follow_up_includes_previous_turns_in_prompt(self):
        history = [{"teacherUtterance": "Here are five apples. How many?", "childResponseText": "Five!"}]
        resp, gen = _run("And if I take one away?", TurnOutcome.INCORRECT, ["Um, three?"], history)
        prompt = gen.call_args.args[0]
        self.assertIn("Conversation so far:", prompt)
        self.assertIn("Teacher: Here are five apples. How many?", prompt)
        self.assertIn("Child: Five!", prompt)
        self.assertLess(prompt.index("Child: Five!"), prompt.index("Teacher just said"))
        self.assertTrue(resp.validation_passed)

    def test_irrelevant_message_prompt_allows_natural_reaction(self):
        _, gen = _run("Good morning, Lumi!", TurnOutcome.CORRECT, ["Good morning!"])
        self.assertIn("did not ask a question", gen.call_args.args[0])

    def test_out_of_level_question_prompt_tells_child_not_to_know(self):
        _, gen = _run("What is 12 times 7?", TurnOutcome.CORRECT, ["I don't know that one."])
        prompt = gen.call_args.args[0]
        self.assertIn("too hard for a 5-to-6-year-old", prompt)

    def test_failed_llm_returns_error_instead_of_fixed_reply(self):
        err = LlmGenerationError("Ollama returned status 404: model not found")
        with self.assertRaises(HTTPException) as caught:
            _run("How many apples?", TurnOutcome.CORRECT, [err, err])
        self.assertEqual(caught.exception.status_code, 502)

    def test_malformed_output_returns_error_instead_of_fixed_reply(self):
        long_ramble = " ".join(["blah"] * 40)
        with self.assertRaises(HTTPException) as caught:
            _run("How many apples?", TurnOutcome.INCORRECT, ["*giggles*", long_ramble])
        self.assertEqual(caught.exception.status_code, 502)

    def test_disabled_llm_returns_service_unavailable(self):
        with mock.patch("app.config.settings.llm_enabled", False):
            with self.assertRaises(HTTPException) as caught:
                child_turn(_request("Hi"))
        self.assertEqual(caught.exception.status_code, 503)

    def test_request_without_recent_turns_still_accepted(self):
        req = ChildTurnRequest.model_validate({
            "sessionId": 1, "turnSequenceNo": 1, "teacherUtterance": "Hi",
            "curriculumTopic": COUNTING,
        })
        self.assertEqual(req.recent_turns, [])


class OutputCleaningTest(unittest.TestCase):

    def test_strips_labels_stage_directions_and_extra_lines(self):
        self.assertEqual(_clean('Child: *giggles* "Five!"\nTeacher: good'), "Five!")
        self.assertEqual(_clean("Um (looks at apples) three?"), "Um three?")


class ValidatorTest(unittest.TestCase):

    def test_curriculum_misconception_is_not_rejected_as_answer_leak(self):
        text = SHAPES.common_misconceptions[0]
        self.assertTrue(validate_response(text, TurnOutcome.INCORRECT, SHAPES, ChildState()).is_valid)

    def test_leak_check_uses_word_boundaries(self):
        topic = CurriculumTopicDTO(**{k: v for k, v in COUNTING.items() if k == "id"},
                                   name="c", objective="o", acceptable_answers=["five", "5"])
        self.assertTrue(validate_response("I see 15 dots", TurnOutcome.INCORRECT, topic, ChildState()).is_valid)
        self.assertFalse(validate_response("It's 5", TurnOutcome.INCORRECT, topic, ChildState()).is_valid)

    def test_distracted_still_rejects_any_answer(self):
        self.assertFalse(validate_response("A circle!", TurnOutcome.DISTRACTED, SHAPES, ChildState()).is_valid)


class PromptTest(unittest.TestCase):

    def test_history_is_capped(self):
        from app.child_agent.models import ConversationTurn
        history = [ConversationTurn(teacher_utterance=f"q{i}", child_response_text=f"a{i}") for i in range(10)]
        prompt = build_prompt(TurnOutcome.CORRECT, ChildState(), SHAPES, "next", history=history)
        self.assertNotIn("Teacher: q5\n", prompt)
        self.assertIn("Teacher: q9", prompt)


if __name__ == "__main__":
    unittest.main()
