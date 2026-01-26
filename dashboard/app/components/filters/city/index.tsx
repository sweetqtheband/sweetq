"use client";

import { Select } from "@/app/components";
import { Cities } from "@/app/services/cities";
import { Option } from "@/types/option";
import { useEffect, useState } from "react";

export default function CityFilter({
  selected = -1,
  selectedState = null,
  disabled = true,
  removable = false,
  isFilter = false,
  onChange = () => true,
  onSelect = () => true,
}: Readonly<{
  selected?: string | number;
  selectedState?: string | number | null;
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
    const query = selectedState !== -1 ? { state_id: selectedState } : null;
    const getItems = async () => {
      const queryItems = query ? (await Cities.getAll(query)).items : [];
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
  }, [selectedState]);

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
      disabled={disabled}
      removable={removable}
      selected={selectedValue}
      items={selectItems}
      placeholder="Ciudad"
      field="city_id"
      onChange={onChange}
      onSelect={onSelect}
      isFilter={isFilter}
    />
  );
}
