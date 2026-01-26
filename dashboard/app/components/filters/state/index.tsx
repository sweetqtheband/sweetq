"use client";

import { Select } from "@/app/components";
import { States } from "@/app/services/states";
import { Option } from "@/types/option";
import { useEffect, useState } from "react";

export default function StateFilter({
  selected = -1,
  selectedCountry = null,
  disabled = true,
  removable = false,
  isFilter = false,
  onChange = () => true,
  onSelect = () => true,
}: Readonly<{
  selected?: string | number;
  selectedCountry?: string | number | null;
  disabled?: boolean;
  removable?: boolean;
  isFilter?: boolean;
  onChange?: Function;
  onSelect?: Function;
}>) {
  const [items, setItems] = useState([]);
  const [selectedValue, setSelectedValue] = useState(selected);

  const [selectItems, setSelectItems]: [Option[], Function] = useState([]);

  useEffect(() => {
    const query = selectedCountry !== -1 ? { country_id: selectedCountry } : null;
    const getItems = async () => {
      const queryItems = query ? (await States.getAll(query)).items : [];
      setItems(queryItems);
      setSelectItems(
        queryItems.map((item: any) => ({
          ...item,
          key: item.id,
          value: item.id,
          text: item.name,
        }))
      );
    };
    getItems();
  }, [selectedCountry]);

  useEffect(() => {
    if (items.length > 0) {
      let selectedOption: any = -1;
      if (selected !== -1) {
        selectedOption = items.find((item: any) => item.id === selected);
        if (selectedOption) {
          setSelectedValue(selectedOption.id);
        }
      }
    }
  }, [items, selected]);

  return (
    <Select
      name="state"
      disabled={disabled}
      removable={removable}
      selected={selectedValue}
      items={selectItems}
      placeholder="Provincia"
      field="state_id"
      onChange={onChange}
      onSelect={onSelect}
      isFilter={isFilter}
    />
  );
}
