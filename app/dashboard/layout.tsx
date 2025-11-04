'use client';
import { ReactNode } from 'react';

export default function DashboardPassThroughLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}