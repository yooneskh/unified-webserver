

export function joinPaths(...paths: string[]) {

  const [first, ...rest] = paths;


  const cleanedRest = rest.map(it =>
    it.slice(
      it.startsWith('/') ? 1  : 0,
      it.endsWith('/')   ? -1 : undefined,
    )
  );

  if (rest[rest.length - 1].endsWith('/')) {
    cleanedRest[cleanedRest.length - 1] = cleanedRest[cleanedRest.length - 1] + '/';
  }


  return [
    first.endsWith('/') ? first.slice(0, -1) : first,
    ...cleanedRest,
  ].join('/');

}