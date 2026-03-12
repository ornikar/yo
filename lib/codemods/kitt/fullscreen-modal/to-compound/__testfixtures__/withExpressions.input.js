function Test() {
  return (
    <FullscreenModal
      header={shouldDisplayHeader ? <FullscreenModal.Header title="With Header and Body" /> : null}
      body={
        shouldDisplayBody ? (
          <View>
            <LoremIpsum />
          </View>
        ) : null
      }
      footer={
        shouldDisplayFooter ? (
          <FullscreenModal.Footer shouldHandleBottomNotch={false}>
            <Button stretch type="primary">
              With Body and Footer
            </Button>
          </FullscreenModal.Footer>
        ) : null
      }
    />
  );
}
