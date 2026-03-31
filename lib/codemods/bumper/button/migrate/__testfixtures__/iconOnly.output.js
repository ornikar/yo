import { Button } from '@ornikar/kitt-universal';

function IconOnlySelfClosing() {
  return <Button icon={<ReplayIcon />} type="primary" onPress={onReplay} />;
}

function IconOnlyWithEmptyChildren() {
  return <Button icon={<ReplayIcon />} type="primary" onPress={onReplay}></Button>;
}
