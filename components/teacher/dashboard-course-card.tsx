import React from "react";
import CourseCard, { CourseCardProps } from "@/components/shared/course-card";

export default function DashboardCourseCard(props: CourseCardProps) {
  return <CourseCard {...props} />;
}
