package com.vstudent.backend.curriculum;

import com.vstudent.backend.persistence.entity.curriculum.CurriculumTopic;
import com.vstudent.backend.persistence.repository.curriculum.CurriculumTopicRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class CurriculumSeeder implements CommandLineRunner {

    private final CurriculumTopicRepository repository;

    public CurriculumSeeder(CurriculumTopicRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        if (repository.count() > 0) {
            return;
        }

        CurriculumTopic counting = new CurriculumTopic(
                "Counting 1 to 5",
                "Child can count a small group of objects from 1 to 5 and state the total.",
                1
        );
        counting.getExampleQuestions().add("How many apples do you see?");
        counting.getExampleQuestions().add("Can you count these blocks for me?");
        counting.getAcceptableAnswers().add("five");
        counting.getAcceptableAnswers().add("5");
        counting.getCommonMisconceptions().add("I counted four, but I skipped one!");
        counting.getCommonMisconceptions().add("Um, three? I lose count sometimes.");

        CurriculumTopic shapes = new CurriculumTopic(
                "Basic Shape Recognition",
                "Child can identify and name circle, square, and triangle.",
                1
        );
        shapes.getExampleQuestions().add("What shape is this?");
        shapes.getExampleQuestions().add("Can you find something round in the room?");
        shapes.getAcceptableAnswers().add("circle");
        shapes.getAcceptableAnswers().add("square");
        shapes.getAcceptableAnswers().add("triangle");
        shapes.getCommonMisconceptions().add("Is it a square? No wait, a triangle has corners too...");

        CurriculumTopic moreOrLess = new CurriculumTopic(
                "More or Less Comparison",
                "Child can compare two small groups and identify which has more or fewer items.",
                2
        );
        moreOrLess.getExampleQuestions().add("Which group has more toys?");
        moreOrLess.getExampleQuestions().add("Does this row have fewer stars than that one?");
        moreOrLess.getAcceptableAnswers().add("this one has more");
        moreOrLess.getAcceptableAnswers().add("that one has fewer");
        moreOrLess.getCommonMisconceptions().add("They look the same to me...");

        repository.save(counting);
        repository.save(shapes);
        repository.save(moreOrLess);
    }
}