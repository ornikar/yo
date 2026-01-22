function Test() {
  return (
    <CardModal>
      {shouldDisplayHeader ? <CardModal.Header title="With Header and Body" /> : null}
      {shouldDisplayBody ? (
        <View>
          <LoremIpsum />
        </View>
      ) : null}
      {shouldDisplayFooter ? (
        <CardModal.Footer shouldHandleBottomNotch={false}>
          <Button stretch type="primary">
            With Body and Footer
          </Button>
        </CardModal.Footer>
      ) : null}
    </CardModal>
  );
}
