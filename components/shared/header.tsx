"use client"

import React from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card"
import {Button} from "@/components/ui/button";
import {Plus} from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  title: string
  description: string
  buttonText?: string
  buttonLink?: string
}

export default function Header({
  title,
  description,
    buttonText,
    buttonLink,
}: HeaderProps) {
  return (
    <Card className="w-full" >
      <div className="flex items-center gap-6 px-3">
        <div className="flex-1">
          <CardHeader className="p-0">
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription className="mt-2 text-sm">
              {description}
            </CardDescription>
          </CardHeader>
        </div>

          {buttonText && buttonLink && (
              <CardAction className=" flex flex-1 shrink-0  items-center justify-end">
                  <Link href={buttonLink}>
                      <Button className="p-5 rounded-3xl">
                          <Plus className="mr-2"/>
                          {buttonText}
                      </Button>
                  </Link>
              </CardAction>
          )}
      </div>
    </Card>
  )
}