export function storageACL(acl) {

  if ('Everyone' in acl) {
    if (acl.Everyone === "READ") {
        return false;
    }
  }

  return true;
}
