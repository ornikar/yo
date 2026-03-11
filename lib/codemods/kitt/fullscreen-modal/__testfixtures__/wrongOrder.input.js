function Test() {
  return (
    <FullscreenModal
      footer={
        <FullscreenModal.Footer shouldHandleBottomNotch={false}>
          <Button stretch type="primary">
            With Body and Footer
          </Button>
        </FullscreenModal.Footer>
      }
      header={<FullscreenModal.Header title="With Header and Body" />}
      body={
        <FullscreenModal.Body>
          <LoremIpsum />
        </FullscreenModal.Body>
      }
    />
  );
}
