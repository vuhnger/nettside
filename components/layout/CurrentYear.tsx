"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getCurrentYear = () => new Date().getFullYear();
const getServerYear = () => undefined;

const CurrentYear = () => {
  const year = useSyncExternalStore(subscribe, getCurrentYear, getServerYear);

  return year ?? null;
};

export default CurrentYear;
