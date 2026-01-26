"use client";
import { useContext, useEffect, useRef, useState } from "react";
import "./select.scss";

import { Option } from "@/types/option";
import { WindowContext, FilterContext } from "@/app/context";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { getClasses, setClasses } from "@/app/utils";

const isVisible = (el: HTMLElement, container: HTMLElement) => {
  const elTop = el.offsetTop;
  const elBottom = elTop + el.clientHeight;

  const containerTop = Math.round(container.scrollTop + el.clientHeight);
  const containerBottom = Math.round(containerTop + container.clientHeight - el.clientHeight);

  // The element is fully visible in the container

  return (
    (elTop >= containerTop && elBottom <= containerBottom) ||
    // Some part of the elment is visible in the container
    (elTop < containerTop && containerTop < elBottom) ||
    (elTop < containerBottom && containerBottom < elBottom)
  );
};

export default function SelectComponent({
  items = [],
  name = "",
  className = null,
  selected = -1,
  disabled = false,
  placeholder = "Selecciona",
  field = "",
  removable = false,
  isFilter = false,
  onChange = () => true,
  onSelect = () => true,
}: Readonly<{
  name?: string;
  className?: string | Record<string, boolean> | Array<string> | null;
  items: Option[];
  selected?: string | number;
  disabled?: boolean;
  placeholder?: string;
  field?: string;
  isFilter?: boolean;
  removable?: boolean;
  onChange?: Function;
  onSelect?: Function;
}>) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const ulRef = useRef<HTMLUListElement | null>(null);

  const [show, setShow] = useState(false);
  const [keyNav, setKeyNav] = useState(false);
  const [direction, setDirection] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [search, setSearch] = useState<string>("");

  const onClickHandler = (e: any) => {
    if (e.target.classList.contains("select--selected-remove")) {
      setSelectedOption(null);
      setShow(false);
      onSelect(null);
    } else {
      let el = e.target;

      try {
        while (!el.classList.contains("select--selected")) {
          el = el.parentElement;
        }

        if (el.classList.contains("select--selected")) {
          setOnChange({ open: true, field });
          setShow(true);
        }
      } catch (err) {}
    }

    if (e.target?.dataset?.id) {
      setSelectedOption(items.find((item) => item.value === e.target.dataset.id) as Option);
      setShow(false);
    }

    e.preventDefault();
    e.stopPropagation();
  };

  const setOnChange = ({ open, field }: { open: boolean; field: string }) => {
    if (filterContext.open !== open || filterContext.field !== field) {
      onChange({ open, field });
    }
  };

  const onFocusHandler = (e: any) => {
    setOnChange({ open: true, field });
    setShow(true);
    e.preventDefault();
    e.stopPropagation();
  };

  const windowClick = useContext(WindowContext);
  const filterContext = useContext(FilterContext);

  useEffect(() => {
    if (filterContext.open && filterContext.field !== field) {
      setShow(false);
    }
  }, [filterContext, field]);

  useEffect(() => {
    if (windowClick.open) {
      setShow(false);
    }
  }, [windowClick]);

  const [focused, setFocused] = useState(-1);

  const onKeyDownHandler = (e: any) => {
    if (e.key !== "Tab") {
      e.preventDefault();
      e.stopPropagation();
    }

    setKeyNav(true);

    if (e.key === "ArrowDown") {
      setDirection("down");
      if (focused === -1) {
        setFocused(0);
      } else if (focused < items.length - 1) {
        setFocused(focused + 1);
      } else {
        setFocused(items.length - 1);
      }
    } else if (e.key === "ArrowUp") {
      setDirection("up");
      if (focused <= 0) {
        setFocused(-1);
      } else {
        setFocused(focused - 1);
      }
      // Space, tab or enter
    } else if ([32, 9, 13].includes(e.keyCode)) {
      if (show) {
        setSelectedOption(items[focused]);
        setShow(false);
      } else if (e.key !== "Tab") {
        setOnChange({ open: true, field });
        setShow(true);
      }
    } else if (
      (e.keyCode >= 48 && e.keyCode <= 57) ||
      (e.keyCode >= 65 && e.keyCode <= 90) ||
      (e.keyCode >= 97 && e.keyCode <= 122)
    ) {
      doSearch(e.key);
    }
  };

  // SEARCH

  useEffect(() => {
    if (search) {
      setFocused(items.findIndex((item) => item?.name?.toLowerCase().includes(search)));
    }
  }, [search, items]);

  const cleanSearch = () => {
    setSearch("");
  };

  let to: any = null;

  const doSearch = (key: string) => {
    setSearch(search + key);
    clearTimeout(to);
    to = setTimeout(() => cleanSearch(), 1000);
  };

  const onMouseOverHandler = (e: any) => {
    if (e.target?.dataset.id && !keyNav) {
      setFocused(items.findIndex((item) => item.value === e.target.dataset.id));
    }
    setKeyNav(false);
  };

  useEffect(() => {
    setSelectedOption(items.find((item) => item.value === selected) as Option);
  }, [selected, items]);

  useEffect(() => {
    if (ulRef.current !== null && focused >= 0) {
      const el = ulRef.current?.children[focused] as HTMLElement;

      if (keyNav && !isVisible(el, ulRef.current)) {
        el.scrollIntoView({
          behavior: "instant",
          block: "nearest",
          inline: "start",
        });
      }
    }
  }, [focused, keyNav, direction]);

  // After change
  useEffect(() => {
    if (isFilter) {
      const params = new URLSearchParams([...Array.from(searchParams.entries())]);

      if (selectedOption) {
        params.set(field, String(selectedOption.value));
      }

      replace(`${pathname}?${params.toString()}`);
    } else {
      onSelect(selectedOption);
    }
  }, [selectedOption, searchParams, pathname, replace, field, isFilter, onSelect]);

  const text = (
    <>
      <span className="select--selected-text">
        {selectedOption?.html ? selectedOption.html : selectedOption?.text}
      </span>
      {removable ? <div className="select--selected-remove"></div> : null}
    </>
  );
  const placeholderText = (
    <>
      <div className="placeholder">{placeholder}</div>
      <div className="select--selected-open"></div>
    </>
  );
  const classes = getClasses({
    select: true,
    [name]: true,
    disabled,
    removable,
    [`${setClasses(className)}`]: true,
  });
  return (
    <div
      className={classes}
      role="menu"
      onFocus={onFocusHandler}
      onKeyDown={onKeyDownHandler}
      onClick={onClickHandler}
      onMouseOver={onMouseOverHandler}
      tabIndex={0}
    >
      <div className="select--selected">{selectedOption ? text : placeholderText}</div>
      <ul className={`select--list ${show ? "open" : ""}`} ref={ulRef}>
        {items.map((item, index) => (
          <li
            key={`${name}-li-${index}`}
            className={`select--list--item ${
              focused === index ? "focused" : ""
            } ${item.selected ? "selected" : ""}`}
            data-id={item.value}
          >
            {item.html ? item.html : item.text}
          </li>
        ))}
      </ul>
    </div>
  );
}
