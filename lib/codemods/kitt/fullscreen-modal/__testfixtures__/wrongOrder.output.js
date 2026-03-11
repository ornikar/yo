function Test() {
  return (
    <FullscreenModal>
      <FullscreenModal.Header title="With Header and Body" />
      <FullscreenModal.Body>
        <LoremIpsum />
      </FullscreenModal.Body>
      <FullscreenModal.Footer shouldHandleBottomNotch={false}>
        <Button stretch type="primary">
          With Body and Footer
        </Button>
      </FullscreenModal.Footer>
    </FullscreenModal>
  );
}
