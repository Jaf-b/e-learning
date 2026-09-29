import React from "react";
import { Course } from "@/types";
import CourseCard from "@/components/shared/course-card";
import { BookOpen } from "lucide-react";

type CourseItem = Omit<Course, "authorId"> & {
  authorId?: Course["authorId"];
  moduleCount?: number;
  filiereName?: string;
  degreeLevelName?: string;
  authorName?: string;
};

interface CourseListProps {
  courses: CourseItem[];
  baseUrl?: string;
  actionLabel?: string;
  emptyMessage?: string;
  onCourseClick?: (course: CourseItem) => void;
}

const CourseList = ({
  courses,
  baseUrl = "/teacher/courses",
  actionLabel = "Gérer le cours",
  emptyMessage = "Aucun cours disponible pour le moment.",
  onCourseClick,
}: CourseListProps) => {
  if (!courses || courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-4 border border-dashed border-border/80 rounded-2xl bg-card/50">
        <div className="p-4 rounded-full bg-primary/10 text-primary mb-3">
          <BookOpen className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-foreground mb-1">Aucun cours trouvé</h3>
        <p className="text-xs text-muted-foreground max-w-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          id={course.id}
          code={course.code}
          title={course.title}
          description={course.description}
          status={course.status}
          credits={course.credits}
          filiereName={course.filiereName}
          degreeLevelName={course.degreeLevelName}
          authorName={course.authorName}
          moduleCount={course.moduleCount}
          href={onCourseClick ? undefined : `${baseUrl}/${course.id}`}
          onClick={onCourseClick ? () => onCourseClick(course) : undefined}
          actionLabel={actionLabel}
        />
      ))}
    </div>
  );
};

export default CourseList;