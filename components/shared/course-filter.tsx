"use client"

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CourseFilterProps {
    onFilterChange: (filterName: string, value: string) => void;
    onFilterReset: () => void;
    filters: {
        name: string;
        department: string;
        promotion: string;
    }
    departmentOptions: string[];
    promotionOptions: string[];
}

export default function CourseFilter({ onFilterChange, onFilterReset, filters, departmentOptions, promotionOptions }: CourseFilterProps) {
    return (
        <div className="flex items-center space-x-4 my-4">
            <Input
                placeholder="Course Name"
                value={filters.name}
                onChange={(e) => onFilterChange("name", e.target.value)}
            />
            <Select onValueChange={(value) => onFilterChange("department", value)} value={filters.department}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Departments</SelectLabel>
                        {departmentOptions.map(option => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
            <Select onValueChange={(value) => onFilterChange("promotion", value)} value={filters.promotion}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Promotion" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectLabel>Promotions</SelectLabel>
                        {promotionOptions.map(option => (
                            <SelectItem key={option} value={option}>{option}</SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
            <Button onClick={onFilterReset}>Reset</Button>
        </div>
    );
}