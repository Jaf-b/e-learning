import React from 'react'
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty"
import { Button } from "../ui/button"
import {House} from "lucide-react";
import {Card, CardContent} from "@/components/ui/card";

function EmptyMessage() {
    return (
        <Card>
            <CardContent>
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <House />
                        </EmptyMedia>
                        <EmptyTitle>No data</EmptyTitle>
                        <EmptyDescription>No data found</EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button>Add data</Button>
                    </EmptyContent>
                </Empty>
            </CardContent>
        </Card>
    )
}

export default EmptyMessage
