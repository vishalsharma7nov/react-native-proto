import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton, ResultCard } from "../components";
import { copy } from "../content/copy";
import { useGetUserDemo } from "../hooks/useGetUserDemo";
import { styles } from "./HomeScreen.styles";

export function HomeScreen() {
  const { output, loading, callGetUser, subtitle } = useGetUserDemo();

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>{copy.title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <PrimaryButton
        label={copy.button}
        loading={loading}
        onPress={callGetUser}
      />
      <ResultCard text={output} />
    </SafeAreaView>
  );
}
