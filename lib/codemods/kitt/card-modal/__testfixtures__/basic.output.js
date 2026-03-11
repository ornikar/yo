function Test() {
  return (
    <CardModal>
      <CardModal.Header title="With Header and Body" />
      <CardModal.Body>
        <LoremIpsum />
      </CardModal.Body>
      <CardModal.Footer shouldHandleBottomNotch={false}>
        <Button stretch type="primary">
          With Body and Footer
        </Button>
      </CardModal.Footer>
    </CardModal>
  );
}
