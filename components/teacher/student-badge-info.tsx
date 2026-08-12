import React from 'react';
import {Badge} from "@/components/ui/badge";

interface StudentBadgeInfoProps {
    filiere: string;
    promotion: string;
}

export const StudentBadgeInfo: React.FC<StudentBadgeInfoProps> = ({ filiere, promotion }) => {
    return (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center">
      <Badge>
        {filiere}
      </Badge>
            <Badge >
        {promotion}
      </Badge>
        </div>
    );
};