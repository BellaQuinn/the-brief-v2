import { GraduateLawSchoolSubNav } from "@/components/graduateLawSchool/GraduateLawSchoolSubNav";

export default function GraduateLawSchoolLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <GraduateLawSchoolSubNav basePath="/academics/graduate-law-school" />
      {children}
    </div>
  );
}
