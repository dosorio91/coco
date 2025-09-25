"use client";
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/components/auth/FirebaseAuthProvider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { getPerfilProfesional, savePerfilProfesional } from "@/lib/services/perfilProfesionalService";
import type { PerfilProfesional } from "@/lib/db/perfilProfesionalTypes";

const defaultPerfil: Omit<PerfilProfesional, "userId" | "correo" | "actualizadoEn"> = {
  fotoURL: "",
  nombre: "",
  apellido: "",
  telefono: "",
  prefijo: "+56",
  zonaHoraria: "America/Santiago",
  enviarRecordatorios: false,
};

export default function PerfilPage() {
  const { user } = useAuth();
  const [perfil, setPerfil] = useState<PerfilProfesional | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getPerfilProfesional(user.uid).then((p) => {
      setPerfil(
        p || {
          ...defaultPerfil,
          userId: user.uid,
          correo: user.email || "",
          actualizadoEn: new Date().toISOString(),
        }
      );
      setLoading(false);
    });
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let newValue: string | boolean = value;
    if (type === "checkbox" && "checked" in e.target) {
      newValue = (e.target as HTMLInputElement).checked;
    }
    setPerfil((prev) => prev ? { ...prev, [name]: newValue } : prev);
  };

  // Compresión de imagen antes de subir
  async function handleFotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = document.createElement("img");
    const reader = new FileReader();
    reader.onload = (ev) => {
      img.src = ev.target?.result as string;
      img.onload = async () => {
        const canvas = document.createElement("canvas");
        const maxDim = 256;
        let w = img.width, h = img.height;
        if (w > h) {
          if (w > maxDim) {
            h *= maxDim / w;
            w = maxDim;
          }
        } else {
          if (h > maxDim) {
            w *= maxDim / h;
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
          setPerfil((prev) => prev ? { ...prev, fotoURL: dataUrl } : prev);
        }
      };
    };
    reader.readAsDataURL(file);
  }

  const handleSave = async () => {
    if (!perfil || !user) return;
    setSaving(true);
    await savePerfilProfesional({
      ...perfil,
      userId: user.uid,
      correo: user.email || "",
      actualizadoEn: new Date().toISOString(),
    });
    setSaving(false);
    alert("Perfil guardado correctamente");
  };

  if (loading || !perfil) return <div className="p-8">Cargando perfil...</div>;

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>
      <div className="flex flex-col items-center mb-6 gap-2">
        <Avatar src={perfil.fotoURL} size={80} />
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFotoChange}
        />
        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
          Cambiar foto de perfil
        </Button>
      </div>
      <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
        <div className="flex gap-2">
          <div className="w-1/2">
            <label className="block text-sm font-medium mb-1">Nombre</label>
            <Input name="nombre" value={perfil.nombre} onChange={handleInputChange} required />
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-medium mb-1">Apellido</label>
            <Input name="apellido" value={perfil.apellido} onChange={handleInputChange} required />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Correo electrónico</label>
          <Input name="correo" value={perfil.correo} disabled />
        </div>
        <div className="flex gap-2">
          <div className="w-1/3">
            <label className="block text-sm font-medium mb-1">Prefijo</label>
            <Input name="prefijo" value={perfil.prefijo} onChange={handleInputChange} />
          </div>
          <div className="w-2/3">
            <label className="block text-sm font-medium mb-1">Teléfono</label>
            <Input name="telefono" value={perfil.telefono} onChange={handleInputChange} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Zona Horaria</label>
          <select
            name="zonaHoraria"
            value={perfil.zonaHoraria}
            onChange={handleInputChange}
            className="w-full border rounded-md px-3 py-2 text-sm"
          >
            <option value="America/Santiago">Chile (America/Santiago)</option>
            <option value="America/Argentina/Buenos_Aires">Argentina</option>
            <option value="America/Lima">Perú</option>
            <option value="America/Bogota">Colombia</option>
            <option value="America/Mexico_City">México</option>
            <option value="Europe/Madrid">España</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="enviarRecordatorios"
            checked={perfil.enviarRecordatorios}
            onChange={handleInputChange}
            id="enviarRecordatorios"
          />
          <label htmlFor="enviarRecordatorios" className="text-sm">Enviar recordatorios de Pacientes</label>
        </div>
        <Button type="submit" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</Button>
      </form>
    </div>
  );
}
