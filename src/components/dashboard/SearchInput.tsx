"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type Props = {
  defaultValue?: string;
  onSearch: (value: string) => void;
};

/** Поиск с debounce 300ms; не дергает onSearch, если значение совпадает с URL */
export function SearchInput({ defaultValue = "", onSearch }: Props) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed === defaultValue.trim()) return;

    const timer = setTimeout(() => onSearch(trimmed), 300);
    return () => clearTimeout(timer);
  }, [value, defaultValue, onSearch]);

  return (
    <div className="relative max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Поиск по описанию и ГОСТ..."
        className="pl-9"
      />
    </div>
  );
}
