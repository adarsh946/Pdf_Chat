import FileUpload from "./components/fileUpload";

export default function Home() {
  return (
    <div className="min-h-screen w-screen flex items-center justify-center">
      <div className="w-[30vw] min-h-screen flex items-center justify-center">
        <FileUpload />
      </div>
      <div className="w-[70vw] min-h-screen">2</div>
    </div>
  );
}
