import {
  getInstructorShell,
  getOrgAdminShell,
  getPlatformAdminShell,
  getShellDefinition,
  type ShellDefinition,
} from '../lib/navigation'

/*
 * Shells for the live routes. They start from the approved shells in lib/navigation.ts and
 * only change what live data decides: the organization's name in the header, and entries for
 * features outside the first release (P21: messaging, certificates; instructor invitations,
 * D6) stay visibly unavailable instead of opening sample pages.
 */

const off = (shell: ShellDefinition, labels: string[]): ShellDefinition => ({
  ...shell,
  navItems: shell.navItems.map((item) => (labels.includes(item.label) ? { ...item, unavailable: true } : item)),
})

export function learnerShell(): ShellDefinition {
  return off(getShellDefinition('learner', '/learn'), ['Certificates', 'Messages'])
}

export function instructorShell(orgSlug: string, orgName: string): ShellDefinition {
  const shell = off(getInstructorShell(orgSlug), ['Invitations', 'Messages', 'Reports', 'Profile'])
  return { ...shell, workspace: { title: orgName, subtitle: 'Instructor workspace' } }
}

export function orgAdminShell(orgSlug: string, orgName: string): ShellDefinition {
  return { ...getOrgAdminShell(orgSlug), workspace: { title: orgName, subtitle: 'Organization admin' } }
}

export function platformShell(): ShellDefinition {
  return off(getPlatformAdminShell(), ['Settings'])
}
