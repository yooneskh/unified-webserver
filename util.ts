

export function joinPaths(...paths: string[]) {

  const [first, ...rest] = paths;

  let fullPath = first;


  for (const nextPath of rest ?? []) {

    if (!fullPath.endsWith('/')) {
      fullPath += '/';
    }

    fullPath += (nextPath.startsWith('/')) ? (nextPath.slice(1)) : (nextPath);

  }


  return fullPath;

}
