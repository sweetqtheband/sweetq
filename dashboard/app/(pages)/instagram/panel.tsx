"use client";

import { Button, Input, Panel, Radio, RadioGroup } from "@/app/components";
import Image from "next/image";
import "./panel.scss";
import { CityFilter, CountryFilter, StateFilter } from "@/app/components/filters";
import { useEffect, useState } from "react";
import { FilterContext } from "@/app/context";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Followers } from "@/app/services/followers";

export default function PagePanel({
  data = null
}: Readonly<{
  data: any
}>
) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  
  const [countryId, setCountryId] = useState(data?.country_id ? data.country_id : "205");
  const [stateId, setStateId] = useState(data?.state_id
    ? String(data?.state_id)
    : -1);
  const [cityId, setCityId] = useState(data?.city_id ? String(data?.city_id) : -1); 
  
  const [filterState, setFilterState] = useState({ open: true, field: "" });
  
  const [treatment, setTreatment] = useState(1);

  const [formState, setFormState] = useState({ ...data });
  const [forceClose, setForceClose] = useState(false);

  useEffect(() => {
    setFormState({
      ...data,
      country_id: data?.country_id ? data.country_id : countryId,
      country: data?.country ? data.country : "Spain"
    });
    setTreatment(data?.treatment || 1);
  }, [data, countryId])

  const onChange = (filterState: { open: boolean; field: string }) => {
    setFilterState(filterState);
  };

  const onCountrySelectHandler = (selected: Record<string, any>) => {
    
    if (selected && countryId !== selected.id) {
      setCountryId(selected.id);
      setFormState({
        ...formState,
        country_id: +selected.id,
        country: selected.name,
      });
    } else if (!selected && formState.country_id) {
      const updateState = {...formState};
      delete updateState.country_id;
      delete updateState.country;
      delete updateState.state_id;
      delete updateState.state;
      delete updateState.city_id;
      delete updateState.city;
      setFormState(updateState);
      setCountryId(-1);
      setStateId(-1);
      setCityId(-1);
    }
  };
  const onStateSelectHandler = (selected: Record<string, any>) => {
    if (selected && stateId !== selected.id) {
      setStateId(selected.id);
      setFormState({
        ...formState,
        state_id: +selected.id,
        state: selected.name,
      });
    } else if (!selected && formState.state_id) {
      const updateState = { ...formState };
      delete updateState.state_id;
      delete updateState.state;
      delete updateState.city_id;
      delete updateState.city;
      setFormState(updateState);
      setStateId(-1);
      setCityId(-1);
    }
  };
  const onCitySelectHandler = (selected: Record<string, any>) => {
    if (selected && cityId !== selected.id) {
      setCityId(selected.id);
      setFormState({
        ...formState,
        city_id: +selected.id,
        city: selected.name,
      });
    } else if (!selected && formState.city_id) {
      const updateState = { ...formState };
      delete updateState.city_id;
      delete updateState.city;
      setFormState(updateState);
      setCityId(-1);
    }
  };
  const onShortNameInputHandler = (value:string) => {
    setFormState({
      ...formState,
      short_name: value
    });
  }
  const onCloseHandler = () => {      
    setForceClose(false);     
    const params = new URLSearchParams(searchParams);
    params.delete("follower_id");

    replace(`${pathname}?${params.toString()}`); 
  }

  const onSaveHandler = async () => {
    await Followers.put(formState)
    setForceClose(true);
  }


  const onTreatmentChangeHandler =  (treatment:number) => {    
    setTreatment(treatment);
    setFormState({
      ...formState,
      treatment: +treatment,      
    });
  }

  const getContent = (data: any) => (
    <>
      <header>
        <Image
          alt={data.full_name}
          className="image"
          width={80}
          height={80}
          src={data.profile_pic_url}
        ></Image>
        <h2>{data.full_name}</h2>
      </header>
      <section className="fields">
        <Input
          name="short_name"
          type="text"
          value={data?.short_name}
          onInput={onShortNameInputHandler}
          placeholder={"Nombre corto"}
        ></Input>
        <FilterContext.Provider value={filterState}>
          <CountryFilter
            selected={countryId}
            onChange={onChange}
            onSelect={onCountrySelectHandler}
            removable={true}
          />
          <StateFilter
            disabled={!countryId}
            selectedCountry={countryId}
            selected={stateId}
            onChange={onChange}
            onSelect={onStateSelectHandler}
            removable={true}
          />
          <CityFilter
            disabled={stateId === -1}
            selectedState={stateId}
            selected={cityId}
            onChange={onChange}
            onSelect={onCitySelectHandler}
            removable={true}
          />
        </FilterContext.Provider>
        <RadioGroup
          label="Tratamiento"
          type="switch"
          onChange={onTreatmentChangeHandler}
        >
          <Radio
            group="treatment"
            value="Persona"
            checked={(treatment && treatment === 1) || undefined}
          />
          <Radio
            group="treatment"
            value="Colectivo"
            checked={(treatment && treatment === 2) || undefined}
          />
        </RadioGroup>
      </section>
      <footer>
        <Button onClick={onSaveHandler}>Guardar</Button>
      </footer>
    </>
  );
  const content = data ? getContent(data) : null;
  return (
    <Panel onClose={onCloseHandler} forceClose={forceClose}>
      {content}
    </Panel>
  )
};