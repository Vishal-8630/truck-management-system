import type React from "react";

export interface InputType {
    type: string;
    label: string;
    name: string;
    inputType?: string;
    options?: string[];
    icon?: React.ReactNode;
}

export type Option = { label: string; value: string | boolean | number };
