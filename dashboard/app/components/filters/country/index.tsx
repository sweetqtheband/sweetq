"use client";

import { Select } from "@/app/components";
import { Countries } from "@/app/services/countries";
import { Option } from "@/types/option";
import { useEffect, useState } from "react";

export default function CountryFilter({
  selected = -1,
  disabled = false,
  removable = false,
  isFilter = false,
  onChange = () => true,
  onSelect = () => true,
}: Readonly<{
  selected?: string | number;
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
    const getItems = async () => {
      const queryItems = (await Countries.getAll()).items;
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
  }, []);

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
      placeholder="País"
      field="country_id"
      onChange={onChange}
      isFilter={isFilter}
      onSelect={onSelect}
    />
  );
}
