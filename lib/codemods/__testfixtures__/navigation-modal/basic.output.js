function Test() {
  return (
    <NavigationModal>
      <NavigationModal.Header title="With Header and Body" />
      <NavigationModal.Body>
        <LoremIpsum />
      </NavigationModal.Body>
      <NavigationModal.Footer shouldHandleBottomNotch={false}>
        <Button stretch type="primary">
          With Body and Footer
        </Button>
      </NavigationModal.Footer>
    </NavigationModal>
  );
}
