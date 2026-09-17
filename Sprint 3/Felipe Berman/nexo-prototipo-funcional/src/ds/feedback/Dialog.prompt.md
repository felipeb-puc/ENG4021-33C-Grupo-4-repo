Centered modal over a green-900 scrim. The overlay is `position:absolute`, so it fills the nearest positioned ancestor — wrap screens in `position:relative`.

```jsx
<Dialog title="Confirmar candidatura" description="Enviaremos seu currículo para a empresa."
  onClose={close} footer={<><Button variant="ghost" onClick={close}>Cancelar</Button><Button icon="arrow-right">Enviar</Button></>} />
```
