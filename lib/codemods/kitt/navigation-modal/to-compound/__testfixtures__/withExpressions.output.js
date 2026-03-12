function Test() {
  return (
    <NavigationModal>
      {shouldDisplayHeader ? <NavigationModal.Header title="With Header and Body" /> : null}
      {shouldDisplayBody ? (
        <View>
          <LoremIpsum />
        </View>
      ) : null}
      {shouldDisplayFooter ? (
        <NavigationModal.Footer shouldHandleBottomNotch={false}>
          <Button stretch type="primary">
            With Body and Footer
          </Button>
        </NavigationModal.Footer>
      ) : null}
    </NavigationModal>
  );
}
