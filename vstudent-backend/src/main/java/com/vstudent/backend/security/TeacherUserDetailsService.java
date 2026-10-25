package com.vstudent.backend.security;

import com.vstudent.backend.persistence.entity.teacher.Teacher;
import com.vstudent.backend.persistence.repository.teacher.TeacherRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class TeacherUserDetailsService implements UserDetailsService {

    private final TeacherRepository teacherRepository;

    public TeacherUserDetailsService(TeacherRepository teacherRepository) {
        this.teacherRepository = teacherRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Teacher teacher = teacherRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("No teacher with email: " + email));

        return User.builder()
                .username(teacher.getEmail())
                .password(teacher.getPasswordHash())
                .authorities("ROLE_" + teacher.getRole().name())
                .build();
    }
}