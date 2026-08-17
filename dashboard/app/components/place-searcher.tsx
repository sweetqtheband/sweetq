"use client";

import { useRef, useCallback, useEffect, ChangeEvent } from "react";
import { TextInput, FormItem } from "@carbon/react";
import { debounce } from "@/app/utils";
import { Field } from "@/types/field";

interface PlaceSearcherProps {
  field: string;
  value?: string;
  translations: any;
  formState: any;
  fields: any;
  methods: any;
  onInputHandler: (field: string, value: string) => void;
}

export default function PlaceSearcher({
  field,
  value,
  translations,
  formState,
  fields,
  methods,
  onInputHandler,
}: PlaceSearcherProps) {
  const inputValue = formState?.[field] || value;
  const pendingValueRef = useRef<string>(inputValue);
  const formStateRef = useRef(formState);
  const debouncedSetAddressRef = useRef<(() => void) | null>(null);

  // Sync the refs with state changes
  useEffect(() => {
    pendingValueRef.current = inputValue;
  }, [inputValue]);

  useEffect(() => {
    formStateRef.current = formState;
  }, [formState]);

  // Create the debounced function once and keep it persistent
  if (!debouncedSetAddressRef.current) {
    debouncedSetAddressRef.current = debounce(() => {
      if (methods[field]?.setAddress) {
        methods[field].setAddress({
          value: pendingValueRef.current,
          field,
          fields,
          formState: formStateRef.current,
          onInputHandler,
        });
      }
    }, 1000);
  }

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      pendingValueRef.current = newValue;
      onInputHandler(field, newValue);

      if (debouncedSetAddressRef.current) {
        debouncedSetAddressRef.current();
      }
    },
    [field, onInputHandler]
  );

  return (
    <div className="cds--text-input__field-outer-wrapper">
      <TextInput
        id={field}
        labelText={translations.fields[field]}
        value={inputValue || ""}
        onChange={handleInputChange}
        readOnly={fields?.options[field]?.readOnly}
      />
    </div>
  );
}
