# Full dataset
dataRaw = read.csv(file.choose(), header=TRUE)
names(dataRaw)

# Convert from miliseconds to seconds
dataRaw$mt <- dataRaw$mt / 1000

# Remove trial #0 of each participant
dataNoZero <- subset(dataRaw, trimws(mt) > 0)

# Only select successful cases
data <- subset(dataNoZero, trimws(status) == "successful")


# Group every 9 clicks together
data1 <- aggregate(mt ~ uid + ct + a + w + eww + d + difficulty, data=data, FUN=mean)

#boxplot(data1$mt ~ data1$a)
#plot(data1$a, data1$mt)

# MT ~ CT
fitCT = aov(data1$mt ~ data1$ct + Error(data1$uid/data1$ct))
summary(fitCT)

# MT ~ W
fitW = aov(data1$mt ~ data1$w + Error(data1$uid/data1$w))
summary(fitW)

# MT ~ EW/W
fitEWW = aov(data1$mt ~ data1$eww + Error(data1$uid/data1$eww))
summary(fitEWW)

# MT ~ A
fitA = aov(data1$mt ~ data1$a + Error(data1$uid/data1$a))
summary(fitA)

# MT ~ D
fitD = aov(data1$mt ~ data1$d + Error(data1$uid/data1$d))
summary(fitD)

# MT ~ CT x W
fitCTW = aov(data1$mt ~ data1$ct*data1$w + Error(data1$uid/data1$ct*data1$w))
summary(fitCTW)

# MT ~ CT x EW/W
fitCTEWW = aov(data1$mt ~ data1$ct*data1$eww + Error(data1$uid/data1$ct*data1$eww))
summary(fitEWW)
# Plot
dataCTEWW = aggregate(mt ~ eww + ct, data=data1, FUN=mean)
dataCTEWWPoint <- subset(dataCTEWW, trimws(ct) == "point")
dataCTEWWPoint$ct <- NULL
dataCTEWWBubble <- subset(dataCTEWW, trimws(ct) == "bubble")
dataCTEWWBubble$ct <- NULL
plot(dataCTEWWBubble, type="o", bty="o", pch=1, col="#009999", ylim=c(0.5,2), xlab="EW/W", ylab="Movement Time (seconds)", xaxt="n")
lines(dataCTEWWPoint, type="o", pch=2, col="red")
legend("bottomleft", legend=c("Bubble", "Point"), col=c("#009999", "red"), pch=c(1,2))
axis(1, at=c(1.33, 2.00, 3.00))

# MT ~ CT x A
fitCTA = aov(data1$mt ~ data1$ct*data1$a + Error(data1$uid/data1$ct*data1$a))
summary(fitCTA)

# MT ~ CT x D
fitCTD = aov(data1$mt ~ data1$ct*data1$d + Error(data1$uid/data1$ct*data1$d))
summary(fitCTD)
# Plot
dataCTD = aggregate(mt ~ d + ct, data=data1, FUN=mean)
dataCTDPoint <- subset(dataCTD, trimws(ct) == "point")
dataCTDPoint$ct <- NULL
dataCTDBubble <- subset(dataCTD, trimws(ct) == "bubble")
dataCTDBubble$ct <- NULL
plot(dataCTDBubble, type="o", bty="o", pch=1, col="#009999", ylim=c(0.5,2), xlab="Intermediate Target Density", ylab="Movement Time (seconds)", xaxt="n")
lines(dataCTDPoint, type="o", pch=2, col="red")
legend("bottomleft", legend=c("Bubble", "Point"), col=c("#009999", "red"), pch=c(1,2))
axis(1, at=c(0.0, 0.5, 1.0))

# Index of Difficulty
dataF <- subset(dataNoZero, trimws(status) == "failed")
# Plot
dataFCTDiff = aggregate(mt ~ difficulty + ct, data=dataF, FUN=mean)
dataFCTDiffPoint <- subset(dataFCTDiff, trimws(ct) == "point")
dataFCTDiffPoint$ct <- NULL
dataFCTDiffBubble <- subset(dataFCTDiff, trimws(ct) == "bubble")
dataFCTDiffBubble$ct <- NULL
ctype <- as.factor(dataFCTDiff[, 2])
plot(dataFCTDiffBubble, bty="o", pch=1, col="#009999", ylim=c(0,1.6), xlab="Index of Difficulty", ylab="Movement Time (seconds)", xaxt="n")
points(dataFCTDiffPoint, pch=2, col="red")
legend("bottomleft", legend=c("Bubble", "Point"), col=c("#009999", "red"), pch=c(1,2))
axis(1, at=seq(0,10,1))
abline(lm(dataFCTDiffBubble$mt ~ dataFCTDiffBubble$difficulty), col="#009999")
abline(lm(dataFCTDiffPoint$mt ~ dataFCTDiffPoint$difficulty), col="red")