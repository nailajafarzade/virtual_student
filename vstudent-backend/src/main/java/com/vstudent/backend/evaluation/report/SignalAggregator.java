package com.vstudent.backend.evaluation.report;

import com.vstudent.backend.persistence.entity.session.SignalType;
import com.vstudent.backend.persistence.entity.session.TeacherSignal;

import java.util.List;

public final class SignalAggregator {

    private SignalAggregator() {
    }

    public static long countTrue(List<TeacherSignal> signals, SignalType type) {
        return signals.stream()
                .filter(s -> s.getSignalType() == type)
                .filter(s -> "true".equalsIgnoreCase(s.getValue()))
                .count();
    }

    public static long countPresent(List<TeacherSignal> signals, SignalType type) {
        return signals.stream().filter(s -> s.getSignalType() == type).count();
    }

    public static long countValueEquals(List<TeacherSignal> signals, SignalType type, String value) {
        return signals.stream()
                .filter(s -> s.getSignalType() == type)
                .filter(s -> value.equalsIgnoreCase(s.getValue()))
                .count();
    }

    public static int sumInt(List<TeacherSignal> signals, SignalType type) {
        return signals.stream()
                .filter(s -> s.getSignalType() == type)
                .mapToInt(s -> Integer.parseInt(s.getValue()))
                .sum();
    }

    public static double sumDouble(List<TeacherSignal> signals, SignalType type) {
        return signals.stream()
                .filter(s -> s.getSignalType() == type)
                .mapToDouble(s -> Double.parseDouble(s.getValue()))
                .sum();
    }
}