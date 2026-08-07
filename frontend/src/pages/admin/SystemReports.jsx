import Reports from '../shared/Reports';

// Admin's nav links here separately from the shared /reports route, but both render the same
// scoped report view — for admin, "scoped" already means system-wide, so no extra logic is needed.
export default function SystemReports() {
  return <Reports title="System Reports" description="System-wide attendance reports across every user." />;
}
