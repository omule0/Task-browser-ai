"use client";
import { HeaderUI } from "./HeaderUI";
import { logout } from "@/app/logout/actions";

export function Header({ user }) {
  return <HeaderUI user={user} logout={logout} />;
}
