package com.example.myapplication

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.myapplication.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MyApplicationTheme {
                CalculatorApp()
            }
        }
    }
}

private fun evaluateExpression(expression: String): String {
    if (expression.isBlank()) return ""
    try {
        var sanitizedExpression = expression
        while (sanitizedExpression.isNotEmpty() && sanitizedExpression.last() in listOf('+', '-', '*', '/', '%', '.')) {
            sanitizedExpression = sanitizedExpression.dropLast(1)
        }

        if (sanitizedExpression.isBlank()) return ""

        val numbers = mutableListOf<Double>()
        val operators = mutableListOf<Char>()
        var currentNumber = ""

        for (char in sanitizedExpression) {
            if (char.isDigit() || char == '.') {
                currentNumber += char
            } else {
                if (currentNumber.isNotEmpty()) {
                    numbers.add(currentNumber.toDouble())
                    currentNumber = ""
                }
                operators.add(char)
            }
        }
        if (currentNumber.isNotEmpty()) {
            numbers.add(currentNumber.toDouble())
        }

        if (numbers.isEmpty() || (numbers.size != operators.size + 1 && operators.isNotEmpty())) return "Error"

        var result = numbers.first()
        for (i in operators.indices) {
            val nextNumber = numbers[i + 1]
            result = when (operators[i]) {
                '+' -> result + nextNumber
                '-' -> result - nextNumber
                '*' -> result * nextNumber
                '/' -> {
                    if (nextNumber == 0.0) return "Error: Div by Zero"
                    result / nextNumber
                }
                '%' -> result % nextNumber
                else -> return "Error"
            }
        }

        return if (result % 1 == 0.0) {
            result.toLong().toString()
        } else {
            String.format("%.4f", result)
        }
    } catch (e: Exception) {
        return "Error"
    }
}

@Composable
fun CalculatorApp() {
    var displayText by remember { mutableStateOf("") }
    var expressionHistory by remember { mutableStateOf("") }
    var justEvaluated by remember { mutableStateOf(false) }

    val numberColor = Color(0xFF333333)
    val operatorColor = Color(0xFFFFA500)
    val actionColor = Color(0xFFA9A9A9)

    Surface(modifier = Modifier.fillMaxSize(), color = Color.Black) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.Bottom,
            horizontalAlignment = Alignment.End
        ) {
            // Expression History Display
            Text(
                text = expressionHistory,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                color = Color.Gray,
                fontSize = 24.sp,
                textAlign = TextAlign.End,
                maxLines = 1
            )
            // Main Display
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 32.dp)
                    .padding(horizontal = 16.dp, vertical = 24.dp)
            ) {
                Text(
                    text = displayText.ifEmpty { "0" },
                    modifier = Modifier.fillMaxWidth(),
                    color = Color.White,
                    fontSize = 48.sp,
                    textAlign = TextAlign.End,
                    maxLines = 2
                )
            }

            // Buttons
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                val buttonRows = listOf(
                    listOf("C", "DEL", "%", "/"),
                    listOf("7", "8", "9", "*"),
                    listOf("4", "5", "6", "-"),
                    listOf("1", "2", "3", "+")
                )

                buttonRows.forEach { row ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        row.forEach { buttonText ->
                            val color = when (buttonText) {
                                in "0".."9" -> numberColor
                                "C", "DEL" -> actionColor
                                else -> operatorColor
                            }
                            CalculatorButton(
                                text = buttonText,
                                modifier = Modifier.weight(1f),
                                color = color,
                                onClick = {
                                    when (buttonText) {
                                        "C" -> {
                                            displayText = ""
                                            expressionHistory = ""
                                            justEvaluated = false
                                        }
                                        "DEL" -> {
                                            if (justEvaluated) {
                                                displayText = ""
                                                expressionHistory = ""
                                                justEvaluated = false
                                            } else if (displayText.isNotEmpty()) {
                                                displayText = displayText.dropLast(1)
                                            }
                                        }
                                        "+", "-", "*", "/", "%" -> {
                                            justEvaluated = false
                                            displayText += buttonText
                                        }
                                        else -> { // Numbers
                                            if (justEvaluated) {
                                                displayText = buttonText
                                                expressionHistory = ""
                                                justEvaluated = false
                                            } else {
                                                displayText += buttonText
                                            }
                                        }
                                    }
                                }
                            )
                        }
                    }
                }

                // Last row with 0, ., and =
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    CalculatorButton(text = "0", modifier = Modifier.weight(2.1f), color = numberColor) {
                        if (justEvaluated) {
                            displayText = "0"
                            expressionHistory = ""
                            justEvaluated = false
                        } else if (displayText != "Error") {
                            displayText += "0"
                        }
                    }
                    CalculatorButton(text = ".", modifier = Modifier.weight(1f), color = numberColor) {
                        if (justEvaluated) {
                            displayText = "."
                            expressionHistory = ""
                            justEvaluated = false
                        } else if (displayText != "Error") {
                            displayText += "."
                        }
                    }
                    CalculatorButton(text = "=", modifier = Modifier.weight(1f), color = operatorColor) {
                        if (displayText.isNotEmpty() && !justEvaluated) {
                            val expressionToEvaluate = displayText
                            val result = evaluateExpression(expressionToEvaluate)
                            expressionHistory = expressionToEvaluate
                            displayText = result
                            justEvaluated = true
                        }
                    }
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
        }
    }
}

@Composable
fun CalculatorButton(
    text: String,
    modifier: Modifier = Modifier,
    color: Color = MaterialTheme.colorScheme.primary,
    onClick: () -> Unit
) {
    val aspectRatio = if (text == "0") 2f else 1f
    Button(
        onClick = onClick,
        modifier = modifier.aspectRatio(aspectRatio),
        shape = CircleShape,
        colors = ButtonDefaults.buttonColors(containerColor = color)
    ) {
        Text(
            text = text,
            fontSize = if (text == "DEL") 20.sp else 32.sp,
            color = Color.White,
            maxLines = 1,
            textAlign = TextAlign.Center
        )
    }
}

@Preview(showBackground = true)
@Composable
fun DefaultPreview() {
    MyApplicationTheme {
        CalculatorApp()
    }
}
