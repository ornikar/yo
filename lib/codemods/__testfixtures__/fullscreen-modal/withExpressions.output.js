function Test() {
  return (
    <FullscreenModal>
      {shouldDisplayHeader ? <FullscreenModal.Header title="With Header and Body" /> : null}
      {shouldDisplayBody ? (
        <View>
          <LoremIpsum />
        </View>
      ) : null}
      {shouldDisplayFooter ? (
        <FullscreenModal.Footer shouldHandleBottomNotch={false}>
          <Button stretch type="primary">
            With Body and Footer
          </Button>
        </FullscreenModal.Footer>
      ) : null}
    </FullscreenModal>
  );
}
