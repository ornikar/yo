function Test() {
  return (
    <CardModal
      header={shouldDisplayHeader ? <CardModal.Header title="With Header and Body" /> : null}
      body={
        shouldDisplayBody ? (
          <View>
            <LoremIpsum />
          </View>
        ) : null
      }
      footer={
        shouldDisplayFooter ? (
          <CardModal.Footer shouldHandleBottomNotch={false}>
            <Button stretch type="primary">
              With Body and Footer
            </Button>
          </CardModal.Footer>
        ) : null
      }
    />
  );
}
