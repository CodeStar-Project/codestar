package com.codestar.backend.controller;

import com.codestar.backend.dto.ApiResponseDto;
import com.codestar.backend.dto.course.CourseBlockDto;
import com.codestar.backend.dto.course.CourseBlockType;
import com.codestar.backend.dto.course.CourseDto;
import com.codestar.backend.dto.course.CoursePageDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*")
public class CourseController {

    private final List<CourseDto> courses;

    public CourseController() {
        courses = List.of(
                new CourseDto(
                        1L,
                        "introduction-variables",
                        "Introduction aux variables",
                        "Bases des variables en Java",
                        List.of(
                                new CoursePageDto(
                                        1,
                                        List.of(
                                                new CourseBlockDto(CourseBlockType.TITLE, "Introduction aux variables").withLevel("h1"),
                                                new CourseBlockDto(CourseBlockType.BLOC, "Une variable permet de stocker une valeur."),
                                                new CourseBlockDto(CourseBlockType.CODE, "int age = 25;").withLanguage("java"),
                                                new CourseBlockDto(CourseBlockType.QUIZ, "Exercice : combien font 2 + 2 ?").withExpectedAnswer("4")
                                        )
                                )
                        )
                ),
                new CourseDto(
                        2L,
                        "conditions-et-operateurs",
                        "Conditions et operateurs",
                        "Comprendre if, else et les operateurs logiques",
                        List.of(
                                new CoursePageDto(
                                        1,
                                        List.of(
                                                new CourseBlockDto(CourseBlockType.TITLE, "Tester des conditions").withLevel("h2"),
                                                new CourseBlockDto(CourseBlockType.WARNING, "Attention aux comparaisons de chaines avec == en Java."),
                                                new CourseBlockDto(CourseBlockType.VALIDATION, "Super, tu sais maintenant utiliser if/else."),
                                                new CourseBlockDto(CourseBlockType.TIP, "Pense a simplifier tes conditions avec des booleens.")
                                        )
                                )
                        )
                )
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponseDto<List<CourseDto>>> getAllCourses() {
        return ResponseEntity.ok(new ApiResponseDto<>(true, "Cours recuperes", courses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponseDto<CourseDto>> getCourseById(@PathVariable Long id) {
        return courses.stream()
                .filter(c -> c.getId().equals(id))
                .findFirst()
                .map(course -> ResponseEntity.ok(new ApiResponseDto<>(true, "Cours recupere", course)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponseDto<>(false, "Cours introuvable", null)));
    }
}
