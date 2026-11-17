import { Center, Loader } from '@mantine/core';

export function PageLoader() {
  return (
    <Center py={120}>
      <Loader type="dots" />
    </Center>
  );
}
