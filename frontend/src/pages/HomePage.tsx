import { useAuth } from "../auth/userAuth";

export function HomePage({ title }: { title: string }) {
  const { user } = useAuth();
  return (
    <section>
      <h1>{title}</h1>
      <p>
        Logged in as {user?.email} with role {user?.role}. This page will be replaced in the next
        step.
      </p>
    </section>
  );
}