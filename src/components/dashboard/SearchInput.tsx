"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type Props = {
  defaultValue?: string;
  onSearch: (value: string) => void;
};

/** Поиск с debounce 300ms */
export function SearchInput({ defaultValue = "", onSearch }: Props) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  useEffect(() => {
    const timer = setTimeout(() => onSearch(value.trim()), 300);
    return () => clearTimeout(timer);
  }, [value, onSearch]);

  return (
    <div className="relative max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Поиск по заголовку и тексту..."
        className="pl-9"
      />
    </div>
  );
}
