import tkinter as tk

# Create window
root = tk.Tk()
root.title("Basic Graphical Primitives")
root.geometry("450x300")

# Create canvas
canvas = tk.Canvas(root, width=450, height=300, bg="white")
canvas.pack()

# Line
canvas.create_line(30, 30, 130, 30, width=2)

# Rectangle
canvas.create_rectangle(30, 60, 130, 110, outline="blue", width=2)

# Square
canvas.create_rectangle(30, 140, 90, 200, outline="black", width=2)

# Circle
canvas.create_oval(170, 60, 250, 140, outline="green", width=2)

# Semicircle (top half)
canvas.create_arc(
    170, 150, 250, 230,
    start=0, extent=180,
    style=tk.ARC,
    width=2
)

# Semicircle bottom line (diameter)
canvas.create_line(
    170, 190,
    250, 190,
    width=2
)
canvas.create_arc(190, 210, 240, 270, width=2, fill="orange", style=tk.CHORD)
canvas.create_arc(280, 260, 330, 200, width=2, fill="blue", style=tk.PIESLICE)

# Text
canvas.create_text(230, 30, text="Basic Graphics")

# Run program
root.mainloop()
