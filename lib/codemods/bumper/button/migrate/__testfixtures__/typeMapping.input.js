import { Button } from '@ornikar/kitt-universal';

function TertiaryDanger() {
  return (
    <Button type="tertiary-danger" onPress={onDelete}>
      Delete
    </Button>
  );
}

function RegularTypes() {
  return (
    <>
      <Button type="primary" onPress={onPress}>
        Primary
      </Button>
      <Button type="tertiary" onPress={onPress}>
        Tertiary
      </Button>
    </>
  );
}
