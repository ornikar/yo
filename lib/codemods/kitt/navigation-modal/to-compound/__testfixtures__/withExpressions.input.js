function Test() {
  return (
    <NavigationModal
      header={shouldDisplayHeader ? <NavigationModal.Header title="With Header and Body" /> : null}
      body={
        shouldDisplayBody ? (
          <View>
            <LoremIpsum />
          </View>
        ) : null
      }
      footer={
        shouldDisplayFooter ? (
          <NavigationModal.Footer shouldHandleBottomNotch={false}>
            <Button stretch type="primary">
              With Body and Footer
            </Button>
          </NavigationModal.Footer>
        ) : null
      }
    />
  );
}
