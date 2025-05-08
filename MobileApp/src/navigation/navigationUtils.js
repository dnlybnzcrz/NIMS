import { CommonActions } from '@react-navigation/native';
import { navigationRef } from '../../App';

export function resetRoot(routeName) {
  navigationRef.current?.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [{ name: routeName }],
    })
  );
}
