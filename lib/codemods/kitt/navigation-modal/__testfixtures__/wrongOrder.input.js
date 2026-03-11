function Test() {
  return (
    <NavigationModal
      footer={
        <NavigationModal.Footer shouldHandleBottomNotch={false}>
          <Button stretch type="primary">
            With Body and Footer
          </Button>
        </NavigationModal.Footer>
      }
      header={<NavigationModal.Header title="With Header and Body" />}
      body={
        <NavigationModal.Body>
          <LoremIpsum />
        </NavigationModal.Body>
      }
    />
  );
}
