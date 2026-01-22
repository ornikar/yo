function Test() {
  return (
    <CardModal
      footer={
        <CardModal.Footer shouldHandleBottomNotch={false}>
          <Button stretch type="primary">
            With Body and Footer
          </Button>
        </CardModal.Footer>
      }
      header={<CardModal.Header title="With Header and Body" />}
      body={
        <CardModal.Body>
          <LoremIpsum />
        </CardModal.Body>
      }
    />
  );
}
