function Test() {
  return (
    <CardModal
      header={<CardModal.Header title="With Header and Body" />}
      body={
        <CardModal.Body>
          <LoremIpsum />
        </CardModal.Body>
      }
      footer={
        <CardModal.Footer shouldHandleBottomNotch={false}>
          <Button stretch type="primary">
            With Body and Footer
          </Button>
        </CardModal.Footer>
      }
    />
  );
}
