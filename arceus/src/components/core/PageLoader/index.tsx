
import { Center } from "@mantine/core";
import Loader from "@/components/core/Loader";
import Title from "@/components/core/Title";

function PageLoader({ message }: { message?: string }) {
  return (
    <Center w="100%" h="100%">
      <Loader />
      {Boolean(message) && (
        <Title variant="h3-medium" className="margin-top">
          {message}
        </Title>
      )}
    </Center>
  );
}

export default PageLoader;
export { PageLoader };
