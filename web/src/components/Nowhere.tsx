export default function Nowhere({ address }: { address: string }) {
  return (
    <div className="notice">
      <h1>Nowhere</h1>
      <p>
        There is no site at <code>{address}</code>. It may never have existed, or no one has
        published it yet.
      </p>
    </div>
  );
}